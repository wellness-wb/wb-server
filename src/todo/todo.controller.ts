import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, UserRole } from '../user/decorator/roles.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }

      const todoData = {
        content: createTodoDto.content ?? null,
        dueDate: createTodoDto.dueDate ?? null,
      };

      return await this.todoService.createTodo(userId, todoData);
    } catch (error) {
      throw new InternalServerErrorException(
        'Todo creation failed: ' + error.message,
      );
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Get()
  async getAllTodos(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      return await this.todoService.findAllTodosByUser(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get todos: ' + error.message,
      );
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Get(':id')
  async getTodoById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      return await this.todoService.findTodoById(userId, id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get todo: ' + error.message,
      );
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteTodoById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      await this.todoService.deleteTodoById(userId, id);
      return { message: 'Todo deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete todo: ' + error.message,
      );
    }
  }

  @Roles(UserRole.Client)
  @UseGuards(RolesGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updateTodo(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new UnauthorizedException('Invalid user');
      }
      return await this.todoService.updateTodoById(userId, id, updateTodoDto);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update todo: ' + error.message,
      );
    }
  }
}