import { z } from "zod";

const createSpecialtiesValidation = z.object({
  title : z.string({
    required_error: "Title is required"
  })
})
export const SpecialtiesValidation ={
    createSpecialtiesValidation
}