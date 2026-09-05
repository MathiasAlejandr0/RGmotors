import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  validateStrongPassword,
  validateStrongUsername,
} from "@/lib/server/adminCredentials";

describe("validateStrongPassword", () => {
  it("acepta una contraseña fuerte", () => {
    expect(validateStrongPassword("RgMotors#2026!")).toBeNull();
  });

  it("rechaza cortas, sin mayúscula, sin número o sin símbolo", () => {
    expect(validateStrongPassword("corta")).not.toBeNull();
    expect(validateStrongPassword("solominusculas1!")).not.toBeNull();
    expect(validateStrongPassword("SOLOMAYUSCULAS1!")).not.toBeNull();
    expect(validateStrongPassword("SinNumeros!!")).not.toBeNull();
    expect(validateStrongPassword("SinSimbolo12")).not.toBeNull();
  });

  it("rechaza reutilizar la contraseña por defecto", () => {
    expect(validateStrongPassword(DEFAULT_ADMIN_PASSWORD)).not.toBeNull();
  });
});

describe("validateStrongUsername", () => {
  it("acepta usuarios válidos distintos al default", () => {
    expect(validateStrongUsername("mathias.rg")).toBeNull();
  });

  it("rechaza usuarios cortos o con caracteres inválidos", () => {
    expect(validateStrongUsername("ab")).not.toBeNull();
    expect(validateStrongUsername("user name")).not.toBeNull();
  });

  it("rechaza el usuario por defecto salvo override de env", () => {
    expect(validateStrongUsername(DEFAULT_ADMIN_USERNAME)).not.toBeNull();
  });
});
