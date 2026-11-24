import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from "class-validator";
import { isImageUrl } from "./is-image-url";

@ValidatorConstraint({ name: "isImageUrl", async: false })
export class IsImageUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === "string" && isImageUrl(value);
  }

  defaultMessage(): string {
    return "must be an http(s) URL ending with .png, .jpg, .jpeg, .webp, or .gif";
  }
}

export function IsImageUrl(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsImageUrlConstraint,
    });
  };
}
