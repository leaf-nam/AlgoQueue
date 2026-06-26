package com.leaf.algoqueue.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupCache implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String email;
    private String nickname;
    private String password;
    private String verificationCode;
}