package com.example.demo.dto;

import com.example.demo.model.TipoDocumento;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PessoaCreateDTO {

    @NotNull(message = "O tipo do documento é obrigatório")
    private TipoDocumento tipoDocumento;

    @NotBlank(message = "O documento é obrigatório")
    private String documento;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    private String telefone;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "O email deve ser válido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    private String senha;

    private String tipoPessoa; // USUARIO, PROPRIETARIO, ADMIN
    private String rg; // Apenas para PROPRIETARIO
    private String nivelAcesso; // Apenas para ADMIN

    @AssertTrue(message = "Tamanho do documento inválido para o tipo especificado")
    public boolean isDocumentoValido() {
        if (tipoDocumento == null || documento == null) {
            return true; // Deixa os outros validadores falharem
        }
        if (tipoDocumento == TipoDocumento.CPF && documento.length() != 11) {
            return false;
        }
        if (tipoDocumento == TipoDocumento.CNPJ && documento.length() != 14) {
            return false;
        }
        return true;
    }

    // Getters and Setters

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getTipoPessoa() {
        return tipoPessoa;
    }

    public void setTipoPessoa(String tipoPessoa) {
        this.tipoPessoa = tipoPessoa;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getNivelAcesso() {
        return nivelAcesso;
    }

    public void setNivelAcesso(String nivelAcesso) {
        this.nivelAcesso = nivelAcesso;
    }
}
