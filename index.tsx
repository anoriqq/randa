import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {RestClient} from 'typed-rest-client'

import './styles.sass'

const baseUrl = process.env.BASE_URL
const restc = new RestClient('application-api', baseUrl)

type TOSS_STATE = 'unexecuted' | 'loading' | 'tossed'
type RESULT_STATE = 'none' | 'hit' | 'miss'

interface RemunerationResponse {
  ok: boolean;
  remuneration?: boolean;
  message?: string;
}

const wait = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 400 * 2 * 2);
  })
}

const App: React.FC = () => {
  const [tossState, setTossState] = useState<TOSS_STATE>('unexecuted')
  const [resultState, setResultState] = useState<RESULT_STATE>('none')
  const [probability, setProbability] = useState<number|undefined>(50)
  const [configModal, setConfigModal] = useState(false)
  const toss = async () => {
    if (tossState === 'unexecuted') {
      setTossState("loading")
      const response = restc.get<RemunerationResponse>(`/api/remuneration?p=${probability}`)
      const [res, a] = await Promise.all([response, wait()])
      if (res.result?.ok) {
        setTossState("tossed")
        setResultState(res.result.remuneration ? 'hit' : 'miss')
        return
      }
      setTossState("unexecuted")
      setResultState('none')
    }
  }
  const reToss = () => {
    if (tossState === 'tossed') {
      setTossState("unexecuted")
      setResultState('none')
    }
  }
  const handleConfigModal = () => {
    setConfigModal(!configModal)
    if(Number.isNaN(probability))setProbability(50)
  }
  const handleProbabilityChange = (num: number) => {
    if (Number.isNaN(num) || num >= 0.000 && num <= 100.000) {
      setProbability(Math.floor(num*1000)/1000)
    }
  }

  return (
    <div className="container">
      <div className="title"><img alt="icon" src="/favicon-32x32.png" /> Randa</div>
      <div className="box-wrapper">
        <section className="box-area">
          <div id="box" className={tossState==='loading'?'loading':''} onClick={toss}>
            <div className="face front"/>
            <div className="face back"/>
            <div className="face right"/>
            <div className="face left">{`${probability}%`}</div>
            <div className="face top">
              <div className="hole"/>
            </div>
            <div className="face bottom"/>
          </div>
        </section>
        <div id="result" className={[
          tossState === 'tossed' && 'show',
          resultState !== 'none' && 'open'].filter(x => x).join(' ')}>
          {resultState==='hit'?'あたり!':'ざんねん'}
        </div>
        <div id="help" className={[tossState === 'unexecuted' && 'show'].filter(x => x).join(' ')}>
          Tap!
        </div>
      </div>
      <div onClick={reToss} id="retoss" className={[resultState !== 'none' && 'show'].filter(x => x).join(' ')}>もう一度</div>
      <div onClick={handleConfigModal}>あたりの確率を変更する</div>
      <div id='config' className={[configModal&&'show'].filter(x => x).join(' ')}>
        <label>
          確率:
          <input type="number" step="1" value={probability} onChange={e => {
            handleProbabilityChange(e.target.valueAsNumber)
          }}/>
          <p>0.000% ~ 100.000%</p>
        </label>
        <button type="button" onClick={handleConfigModal} disabled={Number.isNaN(probability)}>閉じる</button>
      </div>
    </div>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))
