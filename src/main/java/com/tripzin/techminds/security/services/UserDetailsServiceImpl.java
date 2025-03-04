package com.tripzin.techminds.security.services;

import com.tripzin.techminds.entity.User;
import com.tripzin.techminds.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find by email first
        User user = userRepository.findByEmail(username)
                .orElseGet(() -> {
                    // If not found by email, try by phone
                    return userRepository.findByPhone(username)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found with email or phone: " + username));
                });
        
        return UserDetailsImpl.build(user);
    }
}
