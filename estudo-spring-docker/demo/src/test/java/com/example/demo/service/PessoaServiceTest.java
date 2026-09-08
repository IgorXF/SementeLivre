package com.example.demo.service;

import com.example.demo.dto.PessoaCreateDTO;
import com.example.demo.exception.DocumentoJaCadastradoException;
import com.example.demo.exception.EmailJaCadastradoException;
import com.example.demo.model.TipoDocumento;
import com.example.demo.repository.PessoaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PessoaServiceTest {

    @Mock
    private PessoaRepository pessoaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PessoaService pessoaService;

    @Test
    public void deveLancarExcecaoQuandoNaoEncontrado() {
        java.util.UUID id = java.util.UUID.randomUUID();
        when(pessoaRepository.findById(id)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> pessoaService.buscarPorId(id))
                .isInstanceOf(com.example.demo.exception.PessoaNaoEncontradaException.class)
                .hasMessage("Pessoa não encontrada com o ID: " + id);
    }
}
