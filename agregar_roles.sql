use remitos;
CREATE TABLE Roles (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50) NOT NULL
);

INSERT INTO Roles (Nombre) VALUES 
    ('Admin'), 
    ('Técnico'), 
    ('Invitado');
    
    
ALTER TABLE Usuarios 
ADD RolId INT NOT NULL DEFAULT 1;

ALTER TABLE Usuarios 
ADD CONSTRAINT FK_Usuarios_Roles 
    FOREIGN KEY (RolId) REFERENCES Roles(Id);