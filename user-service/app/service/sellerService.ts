import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SellerRepository } from "../repository/sellerRepository";
import { GetToken, VerifyToken } from "../utility/password";
import { ErrorResponse, SuccessResponse } from "../utility/response";
import { AppValidationError } from "../utility/errors";
import { plainToClass } from "class-transformer";
import {
  PaymentMethodInput,
  SellerProgramInput,
} from "../models/dto/JoinSellerProgramInput";

export class SellerService {
  repository: SellerRepository;
  constructor(repository: SellerRepository) {
    this.repository = repository;
  }

  async JoinSellerProgram(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    const payload = await VerifyToken(token);

    if (!payload) return ErrorResponse(403, "authorization failed!");
    const input = plainToClass(SellerProgramInput, event.body);
    const error = await AppValidationError(input);
    if (error) return ErrorResponse(404, error);

    const { firstName, lastName, phoneNumber, address } = input;
    const enrolled = await this.repository.checkEnrolledProgram(
      payload.user_id
    );
    if (enrolled) {
      return ErrorResponse(
        403,
        "You have already enrolled for seller program! You can sell your products now!"
      );
    }
    console.log(">>>>>>>>>>>>>", payload.user_id);

    const updatedUser = await this.repository.updateProfile({
      firstName,
      lastName,
      phoneNumber,
      user_id: payload.user_id,
    });

    console.log("ssssssssss");

    if (!updatedUser) {
      return ErrorResponse(
        500,
        "You have already enrolled for seller program! You can sell your products now!"
      );
    }

    await this.repository.updateAddress({
      ...address,
      user_id: payload.user_id as number,
    });

    const result = await this.repository.createPaymentMethods({
      ...input,
      user_id: payload.user_id,
    });

    if (result) {
      const token = await GetToken(updatedUser);
      return SuccessResponse({
        message: "Successfully Joined sekker program",
        seller: {
          token,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phone: updatedUser.phone,
          userType: updatedUser.user_type,
          _id: updatedUser.user_id,
        },
      });
    } else {
      return ErrorResponse(500, "Error on joining seller program!");
    }
  }

  async GetPaymentMethods(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    const payload = await VerifyToken(token);

    if (!payload) return ErrorResponse(403, "authorization failed!");

    const paymentMethods = await this.repository.getPaymentMethods(
      payload.user_id
    );
    return SuccessResponse({
      paymentMethods,
    });
  }

  async EditPaymentMethod(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    const payload = await VerifyToken(token);

    if (!payload) return ErrorResponse(403, "authorization failed!");
    const input = plainToClass(PaymentMethodInput, event.body);
    const error = await AppValidationError(input);
    if (error) return ErrorResponse(404, error);

    const payment_id = Number(event.pathParameters.id);
    const result = await this.repository.updatePaymentMethods({
      ...input,
      payment_id,
      user_id: payload.user_id,
    });

    if (result) {
      return SuccessResponse({
        message: "Payment method updated!",
      });
    } else {
      return ErrorResponse(500, "Error on joining seller program!");
    }
  }
}
