package com.example.demo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
public class TestController{
    private final JdbcTemplate jdbcTemplate;

    public TestController(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/status")
    public String checkStatus(){
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        return "App conectado. Banco de dados respondendo. Quantidade de usuários na tabela: " + count;
    }
}