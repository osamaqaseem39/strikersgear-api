export class CreateBrandDto {
  name: string;
  slug?: string;
  isActive?: boolean;
}

export class UpdateBrandDto {
  name?: string;
  slug?: string;
  isActive?: boolean;
}
