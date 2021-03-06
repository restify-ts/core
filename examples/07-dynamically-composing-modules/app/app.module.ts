import { RootModule } from '@ditsmod/core';
import { RouterModule } from '@ditsmod/router';

import { FirstModule } from './modules/first/first.module';

@RootModule({
  imports: [RouterModule, FirstModule]
})
export class AppModule {}
