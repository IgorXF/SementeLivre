package com.example.demo.service;

import com.example.demo.dto.ProprietarioCreateRequestDTO;
import com.example.demo.exception.DocumentoJaCadastradoException;
import com.example.demo.exception.EmailJaCadastradoException;
import com.example.demo.exception.RgJaCadastradoException;
import com.example.demo.model.TipoDocumento;
import com.example.demo.repository.LogradouroRepository;
import com.example.demo.repository.PessoaRepository;
import com.example.demo.repository.ProprietarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProprietarioServiceTest {

    @Mock
    private ProprietarioRepository proprietarioRepository;

    @Mock
    private PessoaRepository pessoaRepository;

    @Mock
    private LogradouroRepository logradouroRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProprietarioService proprietarioService;

    private ProprietarioCreateRequestDTO dtoValido() {
        ProprietarioCreateRequestDTO dto = new ProprietarioCreateRequestDTO();
        dto.setNome("Teste Proprietario");
        dto.setTipoDocumento(TipoDocumento.CPF);
        dto.setDocumento("52998224725");
        dto.setEmail("prop@email.com");
        dto.setSenha("senhaSegura123");
        dto.setRg("MG-123456");
        return dto;
    }

    @Test
    public void deveLancarConflitoQuandoEmailDuplicado() {
        ProprietarioCreateRequestDTO dto = dtoValido();
        when(pessoaRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> proprietarioService.criar(dto))
                .isInstanceOf(EmailJaCadastradoException.class);
    }

    @Test
    public void deveLancarConflitoQuandoDocumentoDuplicado() {
        ProprietarioCreateRequestDTO dto = dtoValido();
        when(pessoaRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(pessoaRepository.existsByDocumento(dto.getDocumento())).thenReturn(true);

        assertThatThrownBy(() -> proprietarioService.criar(dto))
                .isInstanceOf(DocumentoJaCadastradoException.class);
    }

    @Test
    public void deveLancarConflitoQuandoRgDuplicado() {
        ProprietarioCreateRequestDTO dto = dtoValido();
        lenient().when(pessoaRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        lenient().when(pessoaRepository.existsByDocumento(dto.getDocumento())).thenReturn(false);
        when(proprietarioRepository.existsByRg(dto.getRg())).thenReturn(true);

        assertThatThrownBy(() -> proprietarioService.criar(dto))
                .isInstanceOf(RgJaCadastradoException.class)
                .hasMessageContaining("RG");
    }

    @Test
    public void deveRejeitarDocumentoComDigitoVerificadorInvalido() {
        ProprietarioCreateRequestDTO dto = dtoValido();
        dto.setDocumento("52998224726");

        assertThatThrownBy(() -> proprietarioService.criar(dto))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
