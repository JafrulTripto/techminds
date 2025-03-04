package com.tripzin.techminds.repository;

import com.tripzin.techminds.entity.User;
import com.tripzin.techminds.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    
    Optional<VerificationToken> findByToken(String token);
    
    List<VerificationToken> findByUser(User user);
    
    List<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);
    
    void deleteByUser(User user);
}
