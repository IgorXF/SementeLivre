package com.example.demo.controller;

import com.example.demo.dto.PessoaCreateDTO;
import com.example.demo.dto.PessoaResponseDTO;
import com.example.demo.model.Admin;
import com.example.demo.model.Pessoa;
import com.example.demo.model.Proprietario;
import com.example.demo.model.Usuario;
import com.example.demo.service.PessoaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PessoaResponseDTO criar(@Valid @RequestBody PessoaCreateDTO dto) {
        Pessoa pessoaCriada = pessoaService.criar(dto);
        return mapToResponse(pessoaCriada);
    }

    @GetMapping("/{id}")
    public PessoaResponseDTO buscarPorId(@PathVariable UUID id) {
        Pessoa pessoa = pessoaService.buscarPorId(id);
        return mapToResponse(pessoa);
    }

    private PessoaResponseDTO mapToResponse(Pessoa p) {
        PessoaResponseDTO dto = new PessoaResponseDTO();
        dto.setId(p.getId());
        dto.setTipoDocumento(p.getTipoDocumento());
        dto.setDocumento(p.getDocumento());
        dto.setNome(p.getNome());
        dto.setTelefone(p.getTelefone());
        dto.setEmail(p.getEmail());
        dto.setDataCadastro(p.getDataCadastro());
        dto.setDataUltimaAlteracao(p.getDataUltimaAlteracao());

        if (p instanceof Proprietario) {
            dto.setTipoPessoa("PROPRIETARIO");
        } else if (p instanceof Admin) {
            dto.setTipoPessoa("ADMIN");
        } else if (p instanceof Usuario) {
            dto.setTipoPessoa("USUARIO");
        }

        return dto;
    }
}
