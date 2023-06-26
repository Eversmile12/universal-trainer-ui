"use client";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import UrlTrainer from "@/components/textBox";
import Header from "@/components/header";
import FileUpload from "@/components/csvUploadBox";
import CSVGenerator from "@/components/csvGenerator";

export default function Home() {
  return (
    <div>
      <Header />

      <Tabs>
        <TabList>
          <Tab>URL Trainer</Tab>
          <Tab>CSV Upload</Tab>
          <Tab>CSV Generator</Tab>
        </TabList>

        <TabPanel>
          <UrlTrainer />
        </TabPanel>
        <TabPanel>
          <FileUpload />
        </TabPanel>
        <TabPanel>
          <CSVGenerator />
        </TabPanel>
      </Tabs>
    </div>
  );
}
