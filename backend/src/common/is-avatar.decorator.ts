import { registerDecorator, type ValidationOptions } from "class-validator";
import { isAvatarValue } from "./is-avatar";

export function IsAvatarValue(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isAvatarValue",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === "string" && isAvatarValue(value);
        },
        defaultMessage() {
          return "Avatar must be an image URL or a small data:image upload";
        },
      },
    });
  };
}
