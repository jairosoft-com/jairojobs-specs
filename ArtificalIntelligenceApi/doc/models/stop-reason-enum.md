
# Stop Reason Enum

The reason that we stopped.
This may be one the following values:
`end_turn`: the model reached a natural stopping point
`max_tokens`: we exceeded the requested max_tokens or the model's maximum
`stop_sequence`: one of your provided custom stop_sequences was generated
`tool_use`: the model invoked one or more tools
In non-streaming mode this value is always non-null. In streaming mode, it is null in the message_start event and non-null otherwise.

## Enumeration

`StopReasonEnum`

## Fields

| Name |
|  --- |
| `EndTurn` |
| `MaxTokens` |
| `StopSequence` |
| `ToolUse` |

