import { describe, expect, it } from "vitest";
import {
  isHoneypotTriggered,
  isValidChilePhone,
  isValidEmail,
  optionalValidRut,
} from "@/lib/server/security";
import { timingSafeEqualString } from "@/lib/auth/session";

describe("security validators", () => {
  it("valida emails", () => {
    expect(isValidEmail("a@b.cl")).toBe(true);
    expect(isValidEmail("malo")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("valida teléfonos Chile", () => {
    expect(isValidChilePhone("+56 9 5907 3127")).toBe(true);
    expect(isValidChilePhone("959073127")).toBe(true);
    expect(isValidChilePhone("123")).toBe(false);
  });

  it("RUT opcional: vacío ok, inválido error", () => {
    expect(optionalValidRut("")).toBeNull();
    expect(optionalValidRut(undefined)).toBeNull();
    expect(optionalValidRut("11.111.111-1")).toBeNull();
    expect(optionalValidRut("12.345.678-0")).toBeTruthy();
  });

  it("detecta honeypot", () => {
    expect(isHoneypotTriggered({ website: "http://spam" })).toBe(true);
    expect(isHoneypotTriggered({ name: "Juan" })).toBe(false);
  });
});

describe("timingSafeEqualString", () => {
  it("iguales y distintos", () => {
    expect(timingSafeEqualString("abc", "abc")).toBe(true);
    expect(timingSafeEqualString("abc", "abd")).toBe(false);
    expect(timingSafeEqualString("ab", "abc")).toBe(false);
  });
});
