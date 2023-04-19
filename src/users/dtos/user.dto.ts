import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  isAdmin: boolean;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @MinLength(8)
  @MaxLength(20)
  @IsOptional()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}

// To be used for serialization
export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  isAdmin: boolean;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
