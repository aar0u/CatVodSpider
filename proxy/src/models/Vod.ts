export class Vod {
  typeName?: string;
  vodId?: string;
  vodName?: string;
  vodPic?: string;
  vodRemarks?: string;
  vodYear?: string;
  vodArea?: string;
  vodActor?: string;
  vodDirector?: string;
  vodContent?: string;
  vodPlayFrom?: string;
  vodPlayUrl?: string;
  vodTag?: string;
  action?: string;

  constructor(init?: Partial<Vod>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
