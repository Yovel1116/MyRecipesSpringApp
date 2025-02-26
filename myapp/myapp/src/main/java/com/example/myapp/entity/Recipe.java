package com.example.myapp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "recipes") // Ensure this matches your database table name
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")  // ✅ Force ID to appear in JSON output
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "prep_time")
    private String prep_time;

    @Column(name = "ingredients")
    private String ingredients;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "cuisine")
    private String cuisine;

    public Recipe() {}

    public Recipe(String name, String prep_time, String ingredients, String instructions, String cuisine) {
        this.name = name;
        this.prep_time = prep_time;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.cuisine = cuisine;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPrep_time() {
        return prep_time;
    }

    public String getIngredients() {
        return ingredients;
    }
    public String getInstructions() {
        return instructions;
    }
    public String getCuisine() {
        return cuisine;
    }

}
