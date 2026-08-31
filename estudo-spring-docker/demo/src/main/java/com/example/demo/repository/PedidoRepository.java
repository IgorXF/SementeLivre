package com.example.demo.repository;

import com.example.demo.model.Pedido;
import com.example.demo.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {
    List<Pedido> findByUsuarioSolicitanteId(UUID usuarioId);
    List<Pedido> findByProprietarioRecebedorId(UUID proprietarioId);
    List<Pedido> findByStatus(StatusPedido status);
}
