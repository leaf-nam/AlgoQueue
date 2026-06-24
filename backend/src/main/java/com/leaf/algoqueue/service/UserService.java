package com.leaf.algoqueue.service;

import com.leaf.algoqueue.common.dto.UserCreateRequest;
import com.leaf.algoqueue.common.dto.UserResponse;
import com.leaf.algoqueue.repository.UserRepository;
import com.leaf.algoqueue.repository.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUser(Long id) {
        return UserResponse.from(findById(id));
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다. username=" + req.getUsername());
        }

        User user = User.builder()
                .username(req.getUsername())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + id));
    }
}