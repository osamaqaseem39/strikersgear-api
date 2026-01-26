export class CreateSizeTypeDto {
  name: string; // UK, EU, Alpha, Free
}

export class CreateSizeDto {
  sizeType: string; // ObjectId
  label: string; // 7, 42, S, M, L, Free
  sortOrder?: number;
}
