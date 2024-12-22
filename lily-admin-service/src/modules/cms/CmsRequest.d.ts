declare namespace CmsRequest {

	export interface Payload {
		data: string;
	}

	export interface cmsBody {
		language: string,
		text: string
	}

	export interface Cms {
		type: string;
		body: Array<cmsBody>
	}

	export interface FaqBody {
		language: string,
		question: string,
		answer: string
	}
	 export interface Faq {
			body: Array<FaqBody>
	 }

	 export interface updateFaq {
		_id: string,
		status?: string
		body?: Array<FaqBody>
	 }

	 export interface GetFaq {
		_id: string
	 }
	 export interface cmsType {
		type: string
	 }
}