package extract

import (
	"fmt"
)

// ExtractError は抽出処理中のエラーを表す
type ExtractError struct {
	Op  string // 操作の種類
	Err error  // 元のエラー
}

func (e *ExtractError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Op, e.Err)
	}
	return e.Op
}

func (e *ExtractError) Unwrap() error {
	return e.Err
}

// newError は新しいExtractErrorを作成する
func newError(op string, err error) error {
	return &ExtractError{
		Op:  op,
		Err: err,
	}
}
