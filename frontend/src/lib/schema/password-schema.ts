import { z } from 'zod';

export const containsUppercase = (str: string) => /[A-Z]/.test(str);

export const containsNumber = (str: string) => /\d/.test(str);

export const containsSpecialChars = (str: string) => {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  return specialChars.test(str);
};

export const passwordSchema = z.string().superRefine((value, ctx) => {
  if (value.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be 5 or more characters long',
      fatal: true,
    });

    return z.NEVER;
  }

  if (value.length > 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be 10 or less characters long',
      fatal: true,
    });

    return z.NEVER;
  }

  if (!containsUppercase(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least contains one uppercase letter',
      fatal: true,
    });

    return z.NEVER;
  }

  if (!containsNumber(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least contains one number',
      fatal: true,
    });

    return z.NEVER;
  }

  if (!containsSpecialChars(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least contains one special characters (@, #, $, etc.)',
      fatal: true,
    });

    return z.NEVER;
  }
});
