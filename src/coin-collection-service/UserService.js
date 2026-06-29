import { UserDTO } from "../coin-collection-dto/UserDTO";
import { UserEntity } from "../coin-collection-entity/UserEntity";
import {
  AuthenticationError,
  NotFoundError,
} from "../coin-collection-exception/CoinCollectionError";
import { UserValidator } from "../coin-collection-validation/UserValidator";

export class UserService {
  #userRepo;
  constructor(userRepo) {
    this.#userRepo = userRepo;
  }
  async getUserById({ id }) {
    UserValidator.validateUserId(id);
    const entity = await this.#userRepo.getUserById(id);
    return UserDTO.fromEntity(entity);
  }
  async postUserData(userDTO) {
    UserValidator.validateUserData(userDTO);
    const dto = UserDTO.fromDTO(userDTO);
    await this.#userRepo.postUserData(UserEntity.fromDTO(dto));
    const entity = await this.getUserById(dto.id);
    return UserDTO.fromEntity(entity);
  }
  async updateUserData({ collection, id }) {
    const entity = await this.getUserById(id);
    const user = userDTO.fromEntity(entity);
    user.collection = collection;
    await this.#userRepo.putUserData(UserEntity.fromDTO(user));
  }
}
