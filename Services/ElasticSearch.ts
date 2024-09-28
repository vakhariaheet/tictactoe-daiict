import { Client } from '@elastic/elasticsearch';


export class ElasticSearch {
    static client: Client;
    constructor() {
        ElasticSearch.client = new Client({
            node: 'http://localhost:9200',
            auth: {
                username: 'elastic',
                password: '1234'
            }
        }
    );
       
    ElasticSearch.client.indices.create({
            index: 'documents',
            body: {
                mappings: {
                    properties: {
                        postid: { type: "text" },
                        content: { type: 'text' },
                        page: { type: "integer" },
                        document_id: { type: "text" }
                    }
                }
            }
        }, { ignore: [ 400 ] });
        console.log('Indices Created ');
    }

    static insert(
        postid: string, content: string, page: string, document_id: string
    ) {
        this.client.index({
            index: 'documents',
            body: {
                postid: postid,
                content: content,
                page: page,
                document_id: document_id
            }
        });
    }
    static insertBulk(data: any) { 
        this.client.bulk({
            index: 'documents',
            body: data
        });
    }
    static search(query: string) {
        return this.client.search({
            index: 'documents',
            body: {
                query: {
                    match: { content: query }
                }
            }
        });
    }

    static delete(postid: string) {
        return this.client.deleteByQuery({
            index: 'documents',
            body: {
                query: {
                    match: { postid: postid }
                }
            }
        });
    }

    static update(postid: string, content: string) {
        return this.client.updateByQuery({
            index: 'documents',
            body: {
                query: {
                    match: { postid: postid }
                },
                script: {
                    source: `ctx._source.content = '${content}'`
                }
            }
        });
    }

};

