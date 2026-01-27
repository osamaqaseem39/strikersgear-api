export class CreateBrandDto {
  name: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}

export class UpdateBrandDto {
  name?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}
