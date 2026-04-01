import "reflect-metadata";

export const IS_PUBLIC_KEY = Symbol("isPublic");

export function Public(): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, target, propertyKey);
    } else {
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
    }
  };
}
