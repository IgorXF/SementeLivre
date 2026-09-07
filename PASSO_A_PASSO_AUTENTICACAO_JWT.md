# Guia Passo a Passo: Evoluindo a Autenticação (Estudos → Semente Livre Backend)

> **Público-Alvo:** Desenvolvedores do projeto **Semente Livre**.  
> **Base de Partida:** Protótipo localizado na pasta `Estudos/` (Spring Security + JJWT + H2).  
> **Objetivo:** Migrar e evoluir a autenticação base de `Estudos/` para a API de produção em `backend/` com **PostgreSQL**, **Flyway**, **Refresh Token**, **Recuperação de Senha** e **Rotas `/auth/**`**.

---

## 📋 Sumário
1. [De `Estudos/` para `backend/`: O que muda?](#1-de-estudos-para-backend-o-que-muda)
2. [Passo 1: Adicionar Dependências no `backend/pom.xml`](#passo-1-adicionar-dependências-no-backendpomxml)
3. [Passo 2: Migration Flyway no PostgreSQL (`V2__criar_tabelas_autenticacao.sql`)](#passo-2-migration-flyway-no-postgresql-v2__criar_tabelas_autenticacaosql)
4. [Passo 3: Mapeamento JPA (Entidades, Enums e UserDetails)](#passo-3-mapeamento-jpa-entidades-enums-e-userdetails)
5. [Passo 4: Configuração de Ambiente (`application.yml`)](#passo-4-configuração-de-ambiente-applicationyml)
6. [Passo 5: Repositórios estendendo `BaseRepository`](#passo-5-repositórios-estendendo-baserepository)
7. [Passo 6: Infraestrutura de Segurança JWT (`security`)](#passo-6-infraestrutura-de-segurança-jwt-security)
8. [Passo 7: DTOs de Entrada e Saída (Records)](#passo-7-dtos-de-entrada-e-saída-records)
9. [Passo 8: Camada de Serviços (`AuthService` e `EmailService`)](#passo-8-camada-de-serviços-authservice-e-emailservice)
10. [Passo 9: Controller REST (`AuthController.java`)](#passo-9-controller-rest-authcontrollerjava)
11. [Passo 10: Garantias de Segurança de Dados e Logs](#passo-10-garantias-de-segurança-de-dados-e-logs)
12. [Passo 11: Como Testar Todos os Fluxos (cURL / Postman)](#passo-11-como-testar-todos-os-fluxos-curl--postman)
13. [Checklist dos Critérios de Aceite](#checklist-dos-critérios-de-aceite)

---

## 1. De `Estudos/` para `backend/`: O que muda?

Você já criou um protótipo funcional em `Estudos/` usando **JJWT (`io.jsonwebtoken` 0.12.5)** e banco H2. Veja o comparativo do que será mantido e do que será evoluído:

| Funcionalidade | Protótipo em `Estudos/` | Produção em `backend/` |
| :--- | :--- | :--- |
| **Biblioteca JWT** | JJWT `0.12.5` | **JJWT `0.12.5`** (mesma de `Estudos`) |
| **Banco de Dados** | H2 em memória | **PostgreSQL + Flyway Migration** |
| **Rotas** | `/cadastrar`, `/login` | **`/auth/cadastrar`**, **`/auth/login`**, **`/auth/refresh`**, **`/auth/recuperar-senha`**, **`/auth/redefinir-senha`** |
| **Roles** | Enum direto no usuário | Tabela **`role_t`** + relacionamento ManyToMany com **`usuario_t`** |
| **Refresh Token** | Não possui | **Implementado** (`refresh_token_t` com rotação) |
| **Recuperação de Senha** | Não possui | **Implementado** (token por e-mail com expiração) |
| **Repositórios** | `JpaRepository` direto | `BaseRepository<T, ID>` (padrão Semente Livre) |

---

## Passo 1: Adicionar Dependências no `backend/pom.xml`

Aproveitando exatamente as mesmas bibliotecas JWT de `Estudos/`, adicione ao `backend/pom.xml`:

```xml
<!-- 1. Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- 2. JJWT (Mesmas dependências usadas na pasta Estudos) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>

<!-- 3. Spring Boot Mail para Envio de E-mails -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

---

## Passo 2: Migration Flyway no PostgreSQL (`V2__criar_tabelas_autenticacao.sql`)

Diferente do H2 de `Estudos/` onde as tabelas eram criadas automaticamente pelo Hibernate, no `backend/` utilizamos **Flyway**.

Crie o arquivo `backend/src/main/resources/db/migration/V2__criar_tabelas_autenticacao.sql`:

```sql
-- 1. Tabela de Perfis/Roles
CREATE TABLE role_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Inserir os perfis padrão do sistema
INSERT INTO role_t (nome) VALUES ('ROLE_ADMIN'), ('ROLE_USUARIO'), ('ROLE_PROPRIETARIO');

-- 2. Tabela de Usuários
CREATE TABLE usuario_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Junção Usuário <-> Role (Muitos para Muitos)
CREATE TABLE usuario_role_t (
    usuario_id UUID NOT NULL REFERENCES usuario_t(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES role_t(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, role_id)
);

-- 4. Tabela de Refresh Tokens
CREATE TABLE refresh_token_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL REFERENCES usuario_t(id) ON DELETE CASCADE,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    revogado BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Tabela de Tokens de Recuperação de Senha
CREATE TABLE token_recuperacao_senha_t (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL REFERENCES usuario_t(id) ON DELETE CASCADE,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE
);
```

---

## Passo 3: Mapeamento JPA (Entidades, Enums e UserDetails)

### 3.1. Enum de Perfis (`entity/enums/PerfilEnum.java`)
```java
package com.sementeLivre.backend.entity.enums;

public enum PerfilEnum {
    ROLE_ADMIN,
    ROLE_USUARIO,
    ROLE_PROPRIETARIO
}
```

### 3.2. Entidade Role (`entity/Role.java`)
```java
package com.sementeLivre.backend.entity;

import com.sementeLivre.backend.entity.enums.PerfilEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "role_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private PerfilEnum nome;
}
```

### 3.3. Entidade Usuário (`entity/Usuario.java`)
Evoluindo a classe `Usuario` de `Estudos/` para a estrutura com `Set<Role>`:

```java
package com.sementeLivre.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "usuario_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // IMPORTANTE: Esconde a senha de logs e toString() automático do Lombok
    @ToString.Exclude
    @Column(nullable = false)
    private String senha;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuario_role_t",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getNome().name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() { return this.senha; }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return Boolean.TRUE.equals(this.ativo); }
}
```

### 3.4. Entidade RefreshToken (`entity/RefreshToken.java`)
```java
package com.sementeLivre.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_token_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "data_expiracao", nullable = false)
    private Instant dataExpiracao;

    @Builder.Default
    @Column(nullable = false)
    private Boolean revogado = false;
}
```

### 3.5. Entidade TokenRecuperacaoSenha (`entity/TokenRecuperacaoSenha.java`)
```java
package com.sementeLivre.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "token_recuperacao_senha_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRecuperacaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "data_expiracao", nullable = false)
    private Instant dataExpiracao;

    @Builder.Default
    @Column(nullable = false)
    private Boolean usado = false;
}
```

---

## Passo 4: Configuração de Ambiente (`application.yml`)

No `backend/src/main/resources/application.yml`:

```yaml
jwt:
  secret: ${JWT_SECRET:sementeLivreChaveSecretaSuperSeguraComMaisDe256Bits1234567890!}
  expiration: 1800000 # 30 minutos em milissegundos
  refresh-expiration-days: 7

spring:
  mail:
    host: ${MAIL_HOST:sandbox.smtp.mailtrap.io}
    port: ${MAIL_PORT:2525}
    username: ${MAIL_USERNAME:seu_usuario}
    password: ${MAIL_PASSWORD:sua_senha}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

---

## Passo 5: Repositórios estendendo `BaseRepository`

No repositório `backend/`, todos os repositórios devem estender `BaseRepository`:

### 5.1. `repository/UsuarioRepository.java`
```java
package com.sementeLivre.backend.repository;

import com.sementeLivre.backend.entity.Usuario;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### 5.2. `repository/RoleRepository.java`
```java
package com.sementeLivre.backend.repository;

import com.sementeLivre.backend.entity.Role;
import com.sementeLivre.backend.entity.enums.PerfilEnum;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends BaseRepository<Role, UUID> {
    Optional<Role> findByNome(PerfilEnum nome);
}
```

### 5.3. `repository/RefreshTokenRepository.java`
```java
package com.sementeLivre.backend.repository;

import com.sementeLivre.backend.entity.RefreshToken;
import com.sementeLivre.backend.entity.Usuario;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends BaseRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUsuario(Usuario usuario);
}
```

### 5.4. `repository/TokenRecuperacaoSenhaRepository.java`
```java
package com.sementeLivre.backend.repository;

import com.sementeLivre.backend.entity.TokenRecuperacaoSenha;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRecuperacaoSenhaRepository extends BaseRepository<TokenRecuperacaoSenha, UUID> {
    Optional<TokenRecuperacaoSenha> findByToken(String token);
}
```

---

## Passo 6: Infraestrutura de Segurança JWT (`security`)

### 6.1. Serviço JWT (`security/JwtService.java`)
Evolução direta da classe `JwtService` de `Estudos/` usando JJWT 0.12.5:

```java
package com.sementeLivre.backend.security;

import com.sementeLivre.backend.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:1800000}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(Usuario usuario) {
        String rolesStr = usuario.getRoles().stream()
                .map(r -> r.getNome().name())
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId().toString())
                .claim("nome", usuario.getNome())
                .claim("roles", rolesStr)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public boolean tokenValido(String token) {
        try {
            Claims claims = extrairClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
```

### 6.2. Carregador de Usuários (`security/UserDetailsServiceImpl.java`)
```java
package com.sementeLivre.backend.security;

import com.sementeLivre.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + username));
    }
}
```

### 6.3. Filtro JWT (`security/SecurityFilter.java`)
Evolução do `JwtAuthenticationFilter` de `Estudos/`:

```java
package com.sementeLivre.backend.security;

import com.sementeLivre.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = recuperarToken(request);
        
        if (token != null && jwtService.tokenValido(token)) {
            String email = jwtService.extrairEmail(token);
            UserDetails usuario = usuarioRepository.findByEmail(email).orElse(null);
            
            if (usuario != null && usuario.isEnabled()) {
                var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
}
```

### 6.4. Configuração Spring Security (`security/SecurityConfig.java`)
Evolução da `SecurityConfig` de `Estudos/` ajustada para liberar a rota `/auth/**`:

```java
package com.sementeLivre.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## Passo 7: DTOs de Entrada e Saída (Records)

Crie os arquivos em `dto/`:

```java
// 7.1. dto/CadastroRequestDTO.java
public record CadastroRequestDTO(
    @NotBlank(message = "O nome é obrigatório") String nome,
    @NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String email,
    @NotBlank(message = "A senha é obrigatória") @Size(min = 6, message = "Mínimo 6 caracteres") String senha
) {}

// 7.2. dto/LoginRequestDTO.java
public record LoginRequestDTO(
    @NotBlank(message = "O e-mail é obrigatório") @Email String email,
    @NotBlank(message = "A senha é obrigatória") String senha
) {}

// 7.3. dto/RefreshTokenRequestDTO.java
public record RefreshTokenRequestDTO(
    @NotBlank(message = "O refresh token é obrigatório") String refreshToken
) {}

// 7.4. dto/SolicitarRecuperacaoDTO.java
public record SolicitarRecuperacaoDTO(
    @NotBlank(message = "O e-mail é obrigatório") @Email String email
) {}

// 7.5. dto/RedefinirSenhaDTO.java
public record RedefinirSenhaDTO(
    @NotBlank(message = "O token é obrigatório") String token,
    @NotBlank(message = "A nova senha é obrigatória") @Size(min = 6) String novaSenha
) {}

// 7.6. dto/TokenResponseDTO.java
public record TokenResponseDTO(
    String accessToken,
    String refreshToken,
    String tokenType,
    Long expiresInSeconds
) {
    public TokenResponseDTO(String accessToken, String refreshToken, Long expiresInSeconds) {
        this(accessToken, refreshToken, "Bearer", expiresInSeconds);
    }
}

// 7.7. dto/UsuarioResponseDTO.java (NUNCA expõe a senha)
public record UsuarioResponseDTO(
    UUID id,
    String nome,
    String email,
    Set<String> roles
) {
    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        Set<String> rolesStr = usuario.getRoles().stream()
                .map(r -> r.getNome().name())
                .collect(Collectors.toSet());
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), rolesStr);
    }
}
```

---

## Passo 8: Camada de Serviços (`AuthService` e `EmailService`)

### 8.1. `service/EmailService.java`
```java
package com.sementeLivre.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailRecuperacaoSenha(String para, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(para);
        message.setSubject("Semente Livre - Recuperação de Senha");
        message.setText("Utilize o token a seguir para redefinir sua senha:\n" + token + "\nExpira em 15 minutos.");
        mailSender.send(message);
    }
}
```

### 8.2. `service/AuthService.java`
```java
package com.sementeLivre.backend.service;

import com.sementeLivre.backend.dto.*;
import com.sementeLivre.backend.entity.*;
import com.sementeLivre.backend.entity.enums.PerfilEnum;
import com.sementeLivre.backend.repository.*;
import com.sementeLivre.backend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenRecuperacaoSenhaRepository tokenRecuperacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${jwt.refresh-expiration-days:7}")
    private Long refreshExpirationDays;

    public AuthService(UsuarioRepository usuarioRepository, RoleRepository roleRepository,
                       RefreshTokenRepository refreshTokenRepository, TokenRecuperacaoSenhaRepository tokenRecuperacaoRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtService jwtService, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenRecuperacaoRepository = tokenRecuperacaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public UsuarioResponseDTO cadastrar(CadastroRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado no sistema.");
        }

        Role roleUsuario = roleRepository.findByNome(PerfilEnum.ROLE_USUARIO)
                .orElseThrow(() -> new IllegalStateException("Role ROLE_USUARIO não encontrada."));

        Usuario usuario = Usuario.builder()
                .nome(dto.nome())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha())) // Criptografa senha com BCrypt
                .ativo(true)
                .build();
        usuario.getRoles().add(roleUsuario);

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public TokenResponseDTO login(LoginRequestDTO dto) {
        var authToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());
        var authentication = authenticationManager.authenticate(authToken);

        Usuario usuario = (Usuario) authentication.getPrincipal();

        String accessToken = jwtService.gerarToken(usuario);
        RefreshToken refreshToken = criarRefreshToken(usuario);

        return new TokenResponseDTO(accessToken, refreshToken.getToken(), 1800L);
    }

    @Transactional
    public TokenResponseDTO refreshToken(RefreshTokenRequestDTO dto) {
        RefreshToken tokenSalvo = refreshTokenRepository.findByToken(dto.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token não encontrado."));

        if (tokenSalvo.getRevogado() || tokenSalvo.getDataExpiracao().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expirado ou revogado.");
        }

        Usuario usuario = tokenSalvo.getUsuario();
        
        // Revoga o refresh token anterior (Rotation)
        tokenSalvo.setRevogado(true);
        refreshTokenRepository.save(tokenSalvo);

        // Gera novos tokens
        String novoAccessToken = jwtService.gerarToken(usuario);
        RefreshToken novoRefreshToken = criarRefreshToken(usuario);

        return new TokenResponseDTO(novoAccessToken, novoRefreshToken.getToken(), 1800L);
    }

    @Transactional
    public void solicitarRecuperacaoSenha(SolicitarRecuperacaoDTO dto) {
        var usuarioOpt = usuarioRepository.findByEmail(dto.email());
        if (usuarioOpt.isEmpty()) return;

        Usuario usuario = usuarioOpt.get();
        String token = UUID.randomUUID().toString();

        TokenRecuperacaoSenha tokenEntity = TokenRecuperacaoSenha.builder()
                .token(token)
                .usuario(usuario)
                .dataExpiracao(Instant.now().plus(15, ChronoUnit.MINUTES))
                .usado(false)
                .build();

        tokenRecuperacaoRepository.save(tokenEntity);
        emailService.enviarEmailRecuperacaoSenha(usuario.getEmail(), token);
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaDTO dto) {
        TokenRecuperacaoSenha tokenEntity = tokenRecuperacaoRepository.findByToken(dto.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de recuperação inválido."));

        if (tokenEntity.getUsado() || tokenEntity.getDataExpiracao().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token de recuperação expirado ou já utilizado.");
        }

        Usuario usuario = tokenEntity.getUsuario();
        usuario.setSenha(passwordEncoder.encode(dto.novaSenha())); // Atualiza hash BCrypt
        usuarioRepository.save(usuario);

        tokenEntity.setUsado(true);
        tokenRecuperacaoRepository.save(tokenEntity);
    }

    private RefreshToken criarRefreshToken(Usuario usuario) {
        refreshTokenRepository.deleteByUsuario(usuario);

        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(UUID.randomUUID().toString())
                .dataExpiracao(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS))
                .revogado(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }
}
```

---

## Passo 9: Controller REST (`AuthController.java`)

No pacote `controller/AuthController.java`:

```java
package com.sementeLivre.backend.controller;

import com.sementeLivre.backend.dto.*;
import com.sementeLivre.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@RequestBody @Valid CadastroRequestDTO dto) {
        UsuarioResponseDTO usuarioCriado = authService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        TokenResponseDTO tokenResponse = authService.login(dto);
        return ResponseEntity.ok(tokenResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(@RequestBody @Valid RefreshTokenRequestDTO dto) {
        TokenResponseDTO tokenResponse = authService.refreshToken(dto);
        return ResponseEntity.ok(tokenResponse);
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> solicitarRecuperacaoSenha(@RequestBody @Valid SolicitarRecuperacaoDTO dto) {
        authService.solicitarRecuperacaoSenha(dto);
        return ResponseEntity.ok(Map.of("mensagem", "Se o e-mail estiver cadastrado, as instruções foram enviadas."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@RequestBody @Valid RedefinirSenhaDTO dto) {
        authService.redefinirSenha(dto);
        return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
    }
}
```

---

## Passo 10: Garantias de Segurança de Dados e Logs

- **BCrypt:** Nenhuma senha trafega em texto puro no banco.
- **ToString.Exclude:** Impede vazamento da hash da senha nos logs de aplicação (`Usuario.java`).
- **DTOs de Saída:** O `UsuarioResponseDTO` e `TokenResponseDTO` omitiram o atributo `senha`.

---

## Passo 11: Como Testar Todos os Fluxos (cURL / Postman)

### 1. Cadastrar Usuário (`POST /auth/cadastrar`)
```bash
curl -X POST http://localhost:8080/auth/cadastrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senhaSegura123"
  }'
```
**Resposta (HTTP 201 Created):**
```json
{
  "id": "e3b0c442-98fc-4c14-9621-e73715c0e29b",
  "nome": "João Silva",
  "email": "joao@email.com",
  "roles": ["ROLE_USUARIO"]
}
```

### 2. Login (`POST /auth/login`)
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senhaSegura123"
  }'
```
**Resposta (HTTP 200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a9c0d12e-3456-7890-abcd-ef1234567890",
  "tokenType": "Bearer",
  "expiresInSeconds": 1800
}
```

### 3. Refresh Token (`POST /auth/refresh`)
```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a9c0d12e-3456-7890-abcd-ef1234567890"
  }'
```

### 4. Solicitar Recuperação de Senha (`POST /auth/recuperar-senha`)
```bash
curl -X POST http://localhost:8080/auth/recuperar-senha \
  -H "Content-Type: application/json" \
  -d '{ "email": "joao@email.com" }'
```

### 5. Redefinir Senha (`POST /auth/redefinir-senha`)
```bash
curl -X POST http://localhost:8080/auth/redefinir-senha \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-recebido-no-email",
    "novaSenha": "novaSenhaSegura456"
  }'
```

---

## Checklist dos Critérios de Aceite

- [x] **POST /auth/login** retorna `access` + `refresh token`
- [x] **POST /auth/cadastrar** retorna HTTP `201` e salva senha criptografada com `BCrypt`
- [x] **Refresh token** revoga o anterior e gera novo `access token` válido
- [x] **Recuperação de senha** gera token com expiração e envia por e-mail
- [x] **Token expira** conforme o tempo configurado no `application.yml`
- [x] **Senha nunca reaparece** em respostas JSON ou logs de aplicação
