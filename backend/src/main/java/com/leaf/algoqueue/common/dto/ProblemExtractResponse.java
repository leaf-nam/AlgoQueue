package com.leaf.algoqueue.common.dto;

import com.leaf.algoqueue.common.enums.Difficulty;
import com.leaf.algoqueue.common.enums.Platform;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProblemExtractResponse {

    private Platform platform;
    private String problemNumber;
    private String title;
    private Difficulty difficulty;
}
