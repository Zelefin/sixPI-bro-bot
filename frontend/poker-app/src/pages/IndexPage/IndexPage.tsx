import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonCell,
  LargeTitle,
  List,
  Section,
  Info,
  Divider,
  Spinner,
  Title,
} from "@telegram-apps/telegram-ui";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { GoPlusCircle } from "react-icons/go";
import { IoPeopleSharp } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa6";
import { PiCoins } from "react-icons/pi";
import { MdOutlineRefresh } from "react-icons/md";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface Table {
  id: string;
  name: string;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
  currentPlayers: number;
}

export const IndexPage: React.FC = () => {
  const { initDataRaw, initData } = retrieveLaunchParams();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/poker/api/tables");
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    const userId = initData?.user?.id;
    const balanceResponse = await fetch(`/get_balance?user_id=${userId}`);
    const balance = await balanceResponse.json();
    setBalance(balance.balance);
  };

  useEffect(() => {
    console.log(initDataRaw);
    fetchTables();
    fetchBalance();

    const intervalId = setInterval(fetchTables, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Header
        userName={initData?.user?.firstName || "None"}
        balance={balance}
      />
      <Divider />
      <LargeTitle className="text-center text-text-color mb-2">
        Tables
      </LargeTitle>
      {isLoading ? (
        <div className="grid place-items-center">
          <Spinner size="m" />
        </div>
      ) : tables.length === 0 ? (
        <Title className="text-center">No tables</Title>
      ) : (
        <List>
          {tables.map((table) => (
            <Section key={table.id} header={`Table "${table.name}"`}>
              <div className="flex items-center ml-6 my-1">
                <PiCoins size={20} />
                <Info type="text" className="ml-1">
                  Blind: {table.smallBlind}/{table.bigBlind}
                </Info>
              </div>
              <div className="flex items-center ml-6 my-1">
                <FaPiggyBank size={20} />
                <Info type="text" className="ml-1">
                  Buy-in: {table.minBuyIn}/{table.maxBuyIn}
                </Info>
              </div>
              <div className="flex items-center ml-6 my-1">
                <IoPeopleSharp size={20} />
                <Info type="text" className="ml-1">
                  Players: {table.currentPlayers}/{table.maxPlayers}
                </Info>
              </div>
              <Divider />
              <Link to={`/table/${table.id}`}>
                <ButtonCell before={<GoPlusCircle size={24} />}>
                  Join table
                </ButtonCell>
              </Link>
            </Section>
          ))}
        </List>
      )}
      <div className="text-center mt-5 mb-5">
        <Button
          size="l"
          mode="filled"
          before={<MdOutlineRefresh size={24} />}
          className="bg-green-500 mr-5"
          onClick={fetchTables}
        >
          Refresh
        </Button>
        <Link to={"/create_table"}>
          <Button size="l" mode="filled" before={<IoPeopleSharp size={24} />}>
            Create Table
          </Button>
        </Link>
      </div>
    </>
  );
};
