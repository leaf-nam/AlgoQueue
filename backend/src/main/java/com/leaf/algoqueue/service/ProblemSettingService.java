package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.ProblemSettingRequest;
import com.leaf.algoqueue.common.dto.ProblemSettingResponse;
import com.leaf.algoqueue.common.dto.ProblemSettingUpdateRequest;
import com.leaf.algoqueue.repository.ProblemRepository;
import com.leaf.algoqueue.repository.ProblemSettingRepository;
import com.leaf.algoqueue.repository.entity.Problem;
import com.leaf.algoqueue.repository.entity.ProblemSetting;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProblemSettingService {

    private final ProblemSettingRepository problemSettingRepository;
    private final UserService userService;
    private final ProblemRepository problemRepository;

    // -----------------------------------------------------------------------
    // 조회
    // -----------------------------------------------------------------------

    public List<ProblemSettingResponse> getSettings(Long userId) {
        userService.findById(userId); // 사용자 존재 검증
        return problemSettingRepository.findAllByUserId(userId)
                .stream()
                .map(ProblemSettingResponse::from)
                .toList();
    }

    public ProblemSettingResponse getSetting(Long userId, Long problemId) {
        return ProblemSettingResponse.from(findByUserIdAndProblemId(userId, problemId));
    }

    // -----------------------------------------------------------------------
    // 생성
    // -----------------------------------------------------------------------

    @Transactional
    public ProblemSettingResponse createSetting(Long userId, ProblemSettingRequest req) {
        User user = userService.findById(userId);
        Problem problem = findProblemById(req.getProblemId());

        if (problemSettingRepository.existsByUserIdAndProblemId(userId, req.getProblemId())) {
            throw new IllegalArgumentException(
                    "이미 설정이 존재합니다. userId=%d, problemId=%d".formatted(userId, req.getProblemId()));
        }

        ProblemSetting setting = ProblemSetting.builder()
                .user(user)
                .problem(problem)
                .language(req.getLanguage())
                .targetTime(req.getTargetTime())
                .difficulty(req.getDifficulty())
                .build();

        return ProblemSettingResponse.from(problemSettingRepository.save(setting));
    }

    // -----------------------------------------------------------------------
    // 수정
    // -----------------------------------------------------------------------

    @Transactional
    public ProblemSettingResponse updateSetting(Long userId, Long problemId, ProblemSettingUpdateRequest req) {
        ProblemSetting setting = findByUserIdAndProblemId(userId, problemId);
        setting.update(req.getLanguage(), req.getTargetTime(), req.getDifficulty());
        return ProblemSettingResponse.from(setting);
    }

    // -----------------------------------------------------------------------
    // 내부 헬퍼
    // -----------------------------------------------------------------------

    private ProblemSetting findByUserIdAndProblemId(Long userId, Long problemId) {
        return problemSettingRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "설정을 찾을 수 없습니다. userId=%d, problemId=%d".formatted(userId, problemId)));
    }

    private Problem findProblemById(Long problemId) {
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + problemId));
    }
}