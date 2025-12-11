DELIMITER //
CREATE TRIGGER trg_auditoria_plan_insert
AFTER INSERT ON plan
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_plan(accion, admin_id, new_data)
    VALUES (
        'INSERT',
        NEW.id_admin,
        JSON_OBJECT(
            'id', NEW.id,
            'nombre', NEW.nombre,
            'descripcion', NEW.descripcion,
            'descripcion_corta', NEW.descripcion_corta,
            'costo_persona', NEW.costo_persona,
            'imagen', NEW.imagen,
            'id_ciudad', NEW.id_ciudad,
            'id_informe', NEW.id_informe
        )
    );
END;
//

CREATE TRIGGER trg_auditoria_plan_update
AFTER UPDATE ON plan
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_plan(accion, admin_id, old_data, new_data)
    VALUES (
        'UPDATE',
        NEW.id_admin,
        JSON_OBJECT(
            'id', OLD.id,
            'nombre', OLD.nombre,
            'descripcion', OLD.descripcion,
            'descripcion_corta', OLD.descripcion_corta,
            'costo_persona', OLD.costo_persona,
            'imagen', OLD.imagen,
            'id_ciudad', OLD.id_ciudad,
            'id_informe', OLD.id_informe
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'nombre', NEW.nombre,
            'descripcion', NEW.descripcion,
            'descripcion_corta', NEW.descripcion_corta,
            'costo_persona', NEW.costo_persona,
            'imagen', NEW.imagen,
            'id_ciudad', NEW.id_ciudad,
            'id_informe', NEW.id_informe
        )
    );
END;
//

CREATE TRIGGER trg_auditoria_plan_delete
AFTER DELETE ON plan
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_plan(accion, admin_id, old_data)
    VALUES (
        'DELETE',
        OLD.id_admin,
        JSON_OBJECT(
            'id', OLD.id,
            'nombre', OLD.nombre,
            'descripcion', OLD.descripcion,
            'descripcion_corta', OLD.descripcion_corta,
            'costo_persona', OLD.costo_persona,
            'imagen', OLD.imagen,
            'id_ciudad', OLD.id_ciudad,
            'id_informe', OLD.id_informe
        )
    );
END;
//

DELIMITER ;
