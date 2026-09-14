package org.example.models;

public class Role {
    private String username;
    private String rolename;

    public Role(String username, String rolename) {
        this.username = username;
        this.rolename = rolename;
    }

    // getters
    public String getUsername() {
        return username;
    }

    public String getRoleName() {
        return rolename;
    }

    // setters
    public void setRoleName(String rolename) {
        this.rolename = rolename;
    }
}
