export type SafeParseSuccess<T> = {
  success: true;
  data: T;
};

export type SafeParseFailure = {
  success: false;
  error: {
    issues: Array<{
      path: Array<string | number>;
      message: string;
    }>;
  };
};

export type SafeParseReturn<T> = SafeParseSuccess<T> | SafeParseFailure;

type Validator<T> = (value: unknown, path: Array<string | number>) => SafeParseReturn<T>;

export class ZodType<T> {
  constructor(protected readonly validator: Validator<T>) {}

  safeParse(value: unknown): SafeParseReturn<T> {
    return this.validator(value, []);
  }

  optional(): ZodType<T | undefined> {
    return new ZodType<T | undefined>((value, path) => {
      if (value === undefined) {
        return { success: true, data: undefined };
      }

      return this.validator(value, path);
    });
  }
}

export type ZodTypeAny = ZodType<unknown>;

export type Infer<TSchema extends ZodTypeAny> = TSchema extends ZodType<infer TValue> ? TValue : never;

class ZodString extends ZodType<string> {
  min(length: number): ZodString {
    return new ZodString((value, path) => {
      const result = this.validator(value, path);

      if (!result.success) {
        return result;
      }

      if (result.data.length < length) {
        return issue(path, `String must contain at least ${length} character(s).`);
      }

      return result;
    });
  }
}

class ZodNumber extends ZodType<number> {
  int(): ZodNumber {
    return new ZodNumber((value, path) => {
      const result = this.validator(value, path);

      if (!result.success) {
        return result;
      }

      if (!Number.isInteger(result.data)) {
        return issue(path, "Number must be an integer.");
      }

      return result;
    });
  }

  nonnegative(): ZodNumber {
    return new ZodNumber((value, path) => {
      const result = this.validator(value, path);

      if (!result.success) {
        return result;
      }

      if (result.data < 0) {
        return issue(path, "Number must be greater than or equal to 0.");
      }

      return result;
    });
  }
}

class ZodArray<T> extends ZodType<T[]> {}
class ZodRecord<T> extends ZodType<Record<string, T>> {}

class ZodObject<TShape extends Record<string, ZodTypeAny>> extends ZodType<{ [K in keyof TShape]: Infer<TShape[K]> }> {
  strict(): ZodObject<TShape> {
    return this;
  }
}

function issue(path: Array<string | number>, message: string): SafeParseFailure {
  return {
    success: false,
    error: {
      issues: [{ path, message }]
    }
  };
}

function mergeIssues(issues: SafeParseFailure["error"]["issues"]): SafeParseFailure {
  return {
    success: false,
    error: { issues }
  };
}

function string(): ZodString {
  return new ZodString((value, path) =>
    typeof value === "string" ? { success: true, data: value } : issue(path, "Expected string.")
  );
}

function number(): ZodNumber {
  return new ZodNumber((value, path) =>
    typeof value === "number" && !Number.isNaN(value) ? { success: true, data: value } : issue(path, "Expected number.")
  );
}

function literal<TValue extends string | number | boolean | null>(expected: TValue): ZodType<TValue> {
  return new ZodType((value, path) =>
    value === expected ? { success: true, data: expected } : issue(path, `Expected literal ${String(expected)}.`)
  );
}

function enumType<TValues extends [string, ...string[]]>(values: TValues): ZodType<TValues[number]> {
  return new ZodType((value, path) =>
    typeof value === "string" && values.includes(value)
      ? { success: true, data: value as TValues[number] }
      : issue(path, `Expected one of: ${values.join(", ")}.`)
  );
}

function array<TItem>(schema: ZodType<TItem>): ZodArray<TItem> {
  return new ZodArray((value, path) => {
    if (!Array.isArray(value)) {
      return issue(path, "Expected array.");
    }

    const data: TItem[] = [];
    const issues: SafeParseFailure["error"]["issues"] = [];

    value.forEach((item, index) => {
      const result = schema["validator"](item, [...path, index]);
      if (result.success) {
        data.push(result.data);
      } else {
        issues.push(...result.error.issues);
      }
    });

    return issues.length > 0 ? mergeIssues(issues) : { success: true, data };
  });
}

function record<TValue>(schema: ZodType<TValue>): ZodRecord<TValue> {
  return new ZodRecord((value, path) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return issue(path, "Expected object.");
    }

    const data: Record<string, TValue> = {};
    const issues: SafeParseFailure["error"]["issues"] = [];

    for (const [key, entry] of Object.entries(value)) {
      const result = schema["validator"](entry, [...path, key]);
      if (result.success) {
        data[key] = result.data;
      } else {
        issues.push(...result.error.issues);
      }
    }

    return issues.length > 0 ? mergeIssues(issues) : { success: true, data };
  });
}

function object<TShape extends Record<string, ZodTypeAny>>(shape: TShape): ZodObject<TShape> {
  return new ZodObject((value, path) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return issue(path, "Expected object.");
    }

    const input = value as Record<string, unknown>;
    const data: Partial<{ [K in keyof TShape]: Infer<TShape[K]> }> = {};
    const issues: SafeParseFailure["error"]["issues"] = [];

    for (const [key, schema] of Object.entries(shape)) {
      const result = schema["validator"](input[key], [...path, key]);
      if (result.success) {
        if (result.data !== undefined) {
          data[key as keyof TShape] = result.data as Infer<TShape[keyof TShape]>;
        }
      } else {
        issues.push(...result.error.issues);
      }
    }

    for (const key of Object.keys(input)) {
      if (!(key in shape)) {
        issues.push({ path: [...path, key], message: "Unrecognized key." });
      }
    }

    return issues.length > 0 ? mergeIssues(issues) : { success: true, data: data as { [K in keyof TShape]: Infer<TShape[K]> } };
  });
}

export const z = {
  string,
  number,
  literal,
  enum: enumType,
  array,
  record,
  object
};

export type { ZodType as ZodSchemaType, ZodTypeAny as ZodSchemaTypeAny };
