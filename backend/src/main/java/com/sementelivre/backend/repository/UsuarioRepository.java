package com.sementelivre.backend.repository;

import com.sementelivre.backend.entity.Usuario;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario, UUID> {
}
