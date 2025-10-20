import { NavigatorScreenParams } from '@react-navigation/native';
import { Task } from '../../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Journal: undefined;
  Sage: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddTask: undefined;
  EditTask: { task: Task };
  TaskCalendar: { task: Task };
};
