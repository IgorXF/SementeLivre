package com.example.demo.controller;

import com.example.demo.dto.LogradouroDTO;
import com.example.demo.dto.PessoaResponseDTO;
import com.example.demo.dto.PessoaUpdateRequestDTO;
import com.example.demo.model.Admin;
import com.example.demo.model.Logradouro;
import com.example.demo.model.Pessoa;
import com.example.demo.model.Proprietario;
import com.example.demo.model.Usuario;
import com.example.demo.service.PessoaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @GetMapping
    public ResponseEntity<List<PessoaResponseDTO>> listar() {
        List<PessoaResponseDTO> pessoas = pessoaService.listarTodas().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PessoaResponseDTO> buscarPorId(@PathVariable UUID id) {
        Pessoa pessoa = pessoaService.buscarPorId(id);
        return ResponseEntity.ok(mapToResponse(pessoa));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PessoaResponseDTO> atualizar(@PathVariable UUID id, @Valid @RequestBody PessoaUpdateRequestDTO dto) {
        Pessoa pessoa = pessoaService.atualizar(id, dto);
        return ResponseEntity.ok(mapToResponse(pessoa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        pessoaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    protected PessoaResponseDTO mapToResponse(Pessoa p) {
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

        if (p.getLogradouro() != null) {
            LogradouroDTO end = new LogradouroDTO();
            Logradouro l = p.getLogradouro();
            end.setLogradouro(l.getLogradouro());
            end.setNumero(l.getNumero());
            end.setComplemento(l.getComplemento());
            end.setBairro(l.getBairro());
            end.setMunicipio(l.getMunicipio());
            end.setUf(l.getUf());
            end.setCep(l.getCep());
            dto.setEndereco(end);
        }

        return dto;
    }
}
