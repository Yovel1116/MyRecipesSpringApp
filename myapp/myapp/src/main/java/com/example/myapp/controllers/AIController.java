package com.example.myapp.controllers;


import com.example.myapp.services.AIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public String askAI(@RequestBody String prompt) {
        return aiService.getAIResponse(prompt);
    }
}
