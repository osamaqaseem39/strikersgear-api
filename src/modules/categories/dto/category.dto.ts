export class CreateCategoryDto {
  name: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}
