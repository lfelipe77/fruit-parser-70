import { z } from "zod";

// Validação para criação de rifa
export const rifaFormSchema = z.object({
  title: z.string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-Z0-9\s\-.,!?()]+$/, "Título contém caracteres não permitidos"),
  
  description: z.string()
    .min(1, "Descrição é obrigatória")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  
  category: z.string()
    .min(1, "Categoria é obrigatória"),
  
  subcategory: z.string().optional(),
  
  prizeValue: z.string()
    .min(1, "Valor do prêmio é obrigatório")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Valor do prêmio deve ser um número positivo"),
  
  ticketPrice: z.string()
    .min(1, "Valor do bilhete é obrigatório")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.1 && num <= 1000;
    }, "Valor do bilhete deve estar entre R$ 0,10 e R$ 1.000,00"),
  
  countryRegion: z.string()
    .min(1, "País/Região é obrigatório"),
  
  state: z.string().optional(),
  city: z.string().optional(),
  
  affiliateLink: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Campo opcional
      return val.startsWith("https://") && /^https:\/\/[^\s]+\.[^\s]+/.test(val);
    }, "Link deve ser uma URL válida começando com https://"),
});

// Validação para cadastro de usuário
export const signUpSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  
  email: z.string()
    .email("Email deve ter um formato válido")
    .min(1, "Email é obrigatório"),
  
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Campo opcional
      return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val) || /^\d{10,11}$/.test(val.replace(/\D/g, ''));
    }, "Formato de telefone inválido"),
  
  cpf: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Campo opcional
      const cpfNumbers = val.replace(/\D/g, '');
      return cpfNumbers.length === 11;
    }, "CPF deve ter 11 dígitos"),
  
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/(?=.*[a-z])/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/(?=.*[A-Z])/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/(?=.*\d)/, "Senha deve conter pelo menos um número")
    .regex(/(?=.*[@$!%*?&.#])/, "Senha deve conter pelo menos um símbolo (@$!%*?&.#)"),
  
  confirmPassword: z.string()
    .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Validação para login
export const loginSchema = z.object({
  email: z.string()
    .email("Email deve ter um formato válido")
    .min(1, "Email é obrigatório"),
  
  password: z.string()
    .min(1, "Senha é obrigatória"),
});

// Tipos TypeScript derivados dos schemas
export type RifaFormData = z.infer<typeof rifaFormSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;