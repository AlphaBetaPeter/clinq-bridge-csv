import axios, { AxiosResponse } from "axios";
import { Contact, CrmAdapter, CrmConfig, start } from "clinq-crm-bridge";
import csv = require("csvtojson");

interface CsvContact {
	id: string;
	name: string;
	number: string;
	type: string;
}

function parseCsv (data: string): Promise<CsvContact[]> {
	return new Promise((resolve, reject) => {
		const parsed: CsvContact[] = [];
		csv()
			.fromString(data)
			.on("json", row => {
				parsed.push(row);
			})
			.on("done", error => {
				resolve(parsed);
			})
			.on("error", err => {
				reject(err);
			});
	});
}

function mapToContact (csvContacts: CsvContact[]): Contact[] {
	return csvContacts.map(csvContact => {
		const contact: Contact = {
			name: csvContact.name,
			phoneNumbers: [{
				label: csvContact.type,
				phoneNumber: csvContact.number
			}]
		};
		return contact;
	});
}

class CsvCrmAdapter implements CrmAdapter {
	public async getContacts(config: CrmConfig): Promise<Contact[]> {
		const csvResponse: AxiosResponse = await axios.get(config.apiUrl);
		const parsedCsv: CsvContact[]= await parseCsv(csvResponse.data);
		return mapToContact(parsedCsv);
	}
}

start(new CsvCrmAdapter());
