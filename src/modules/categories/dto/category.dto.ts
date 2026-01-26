export class CreateCategoryDto {
  name: string;
  slug?: string;
  isActive?: boolean;
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  isActive?: boolean;
}
