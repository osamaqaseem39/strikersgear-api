export class CreateCategoryDto {
  name: string;
  slug?: string;
  parent?: string | null;
  image?: string;
  isActive?: boolean;
}

export class UpdateCategoryDto {
  name?: string;
  slug?: string;
  parent?: string | null;
  image?: string;
  isActive?: boolean;
}
