import {
  Button,
  ButtonCell,
  LargeTitle,
  List,
  Section,
  Info,
  Divider,
} from "@telegram-apps/telegram-ui";
import { GoPlusCircle } from "react-icons/go";
import { IoPeopleSharp } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa6";
import { PiCoins } from "react-icons/pi";
import type { FC } from "react";
import { Link } from "react-router-dom";

export const IndexPage: FC = () => {
  return (
    <>
      <LargeTitle className="text-center text-blue-600 mb-2">Tables</LargeTitle>
      <List>
        <Section header='Table "Super lobby"'>
          <div className="flex items-center ml-6 my-1">
            <PiCoins size={20} />
            <Info type="text" className="ml-1">
              Blind: 1/2
            </Info>
          </div>
          <div className="flex items-center ml-6 my-1">
            <FaPiggyBank size={20} />
            <Info type="text" className="ml-1">
              Buy-in: 10/30
            </Info>
          </div>
          <div className="flex items-center ml-6 my-1">
            <IoPeopleSharp size={20} />
            <Info type="text" className="ml-1">
              Players: 3/12
            </Info>
          </div>
          <Divider />
          <Link to={"/table"}>
            <ButtonCell before={<GoPlusCircle size={24} />}>
              Join table
            </ButtonCell>
          </Link>
        </Section>
        <Section header='Table "KEKE"'>
          <div className="flex items-center ml-6 my-1">
            <PiCoins size={20} />
            <Info type="text" className="ml-1">
              Blind: 1/2
            </Info>
          </div>
          <div className="flex items-center ml-6 my-1">
            <FaPiggyBank size={20} />
            <Info type="text" className="ml-1">
              Buy-in: 10/30
            </Info>
          </div>
          <div className="flex items-center ml-6 my-1">
            <IoPeopleSharp size={20} />
            <Info type="text" className="ml-1">
              Players: 3/12
            </Info>
          </div>
          <Divider />
          <Link to={"/table"}>
            <ButtonCell before={<GoPlusCircle size={24} />}>
              Join table
            </ButtonCell>
          </Link>
        </Section>
      </List>
      <div className="text-center mt-5 mb-5">
        <Link to={"/create_table"}>
          <Button size="l" mode="filled" before={<IoPeopleSharp size={24} />}>
            Create Table
          </Button>
        </Link>
      </div>
    </>
  );
};
