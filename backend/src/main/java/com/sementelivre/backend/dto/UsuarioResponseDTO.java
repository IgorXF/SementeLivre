package com.sementelivre.backend.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "UsuarioResponseDTO", description = "Dados retornados de um usuário")
public class UsuarioResponseDTO {
    @Schema(description = "Identificador do usuário", example = "550e8400-e29b-41d4-a716-446655440000", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @Schema(description = "Nome do usuário", example = "Maria da Silva", accessMode = Schema.AccessMode.READ_ONLY)
    private String nome;

    @Schema(description = "Email do usuário", example = "maria@example.com", accessMode = Schema.AccessMode.READ_ONLY)
    private String email;
}
