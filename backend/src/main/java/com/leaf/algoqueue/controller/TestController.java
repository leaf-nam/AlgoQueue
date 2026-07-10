package com.leaf.algoqueue.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/bad-request")
    public ResponseEntity<String> badRequest(@Valid TestRequest req) {
        return ResponseEntity.ok(req.getName());
    }

    @GetMapping("/forbidden")
    public ResponseEntity<String> forbidden() {
        throw new AccessDeniedException("권한이 없습니다.");
    }

    @GetMapping("/error")
    public ResponseEntity<String> error() {
        throw new RuntimeException("서버 에러");
    }

    @Getter
    @Setter
    public static class TestRequest {
        @NotBlank(message = "name은 필수입니다.")
        private String name;
    }
}
