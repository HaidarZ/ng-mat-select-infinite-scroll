
# Angular Material Infinite Scroll  
  
Adds missing infinite scroll functionality for the angular material select component  
  
  
## Inputs  
  
| Property    | Description                                                                                                                                                                                                                                                                                                              | Type                | Default    |  
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------- |  
| `complete`  | If `true`, the `infinitScroll` output will no longer be triggered                                                                                                                                                                                                                                                        | `boolean`           | `false`    |  
| `threshold` | The threshold distance from the bottom of the options list to call the `infiniteScroll` output event when scrolled. The threshold value can be either in percent, or in pixels. For example, use the value of `10%` for the `infiniteScroll` output event to get called when the user has needs 10% to reach the bottom. | `string`            | `'15%'`    |

# Outputs
| Property         | Description                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------| 
| `infinitScroll`  | `EventEmitter` which triggers when a load event is required
