package com.leaf.algoqueue.common.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemoUpdateRequest {

    // 회고는 빈 문자열로 초기화도 허용
    private String memo;
}